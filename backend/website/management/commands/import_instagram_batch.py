"""Explicit, repeatable draft import. No deployment migration or existing-post edits."""
import json
import re
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from website.models import BlogPost, BlogPostImage, SEOPage


class Command(BaseCommand):
    help = 'Import reviewed Instagram articles as drafts (or local-only previews).'

    def add_arguments(self, parser):
        parser.add_argument('--local-preview', action='store_true')
        parser.add_argument('--publish', action='store_true', help='Publish approved new articles, never overwrite existing articles.')
        parser.add_argument('--batch', choices=['01','02','03'], default='01')

    @transaction.atomic
    def handle(self, *args, **options):
        preview = options['local_preview']
        db = settings.DATABASES['default']
        if preview and (not settings.DEBUG or db['ENGINE'] != 'django.db.backends.sqlite3' or Path(db['NAME']).resolve() != (settings.BASE_DIR/'db.sqlite3').resolve()):
            raise CommandError('Preview is restricted to the local development SQLite database.')
        publish = preview or options['publish']
        path = settings.BASE_DIR/f'website/data/instagram-batch-{options["batch"]}.json'
        posts = json.loads(path.read_text(encoding='utf-8'))
        for post in posts:
            slug = post['slug']
            if BlogPost.objects.filter(slug=slug).exists():
                self.stdout.write(f'Skipped existing: {slug}')
                continue
            plain = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', post['content'])
            words = len(plain.split())
            if words <= 200 or '# ' in post['content'].replace('## ', ''):
                raise CommandError(f'Invalid content or word count: {slug}')
            images = [f'blog/instagram/{slug}/{i+1:02d}.webp' for i in range(len(post['photos']))]
            cover = post.get('cover_image') or images[0]
            for image in [cover, *images]:
                if not (settings.MEDIA_ROOT/image).is_file():
                    raise CommandError(f'Missing optimized image: {image}')
            video_url = post.get('video_url','')
            if preview:
                video_url = video_url.replace('https://gordon.ba/backend/media/', 'http://127.0.0.1:8011/media/')
            article = BlogPost.objects.create(
                title=post['title'], slug=slug, excerpt=post['excerpt'], content=post['content'],
                category=post['category'], location=post['location'], cover_logo='gordondm',
                cover_image=cover, video_url=video_url, is_published=publish,
            )
            for i, image in enumerate(images):
                BlogPostImage.objects.create(post=article, image=image, caption=post['photo_captions'][i], order=i)
            SEOPage.objects.get_or_create(route=f'/blog/{slug}', defaults={
                'page_name': post['title'][:120], 'title_bs': post['title']+' | GordonDM',
                'description_bs': post['excerpt'], 'primary_keyword': post['primary_keyword'],
                'secondary_keywords': post['secondary_keywords'], 'search_intent': 'informational',
                'schema_type': 'WebPage', 'is_active': publish, 'is_indexed': publish,
                'canonical_url': f'https://gordon.ba/blog/{slug}',
            })
            self.stdout.write(f'Created {"local preview" if preview else "draft"}: {slug} ({words} words)')
