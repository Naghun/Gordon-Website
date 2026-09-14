"""Export published content for the static HTML and sitemap build."""
import json
from pathlib import Path
from django.core.management.base import BaseCommand
from website.models import BlogPost


class Command(BaseCommand):
    help = 'Export only published blog fields to a frontend build snapshot.'

    def add_arguments(self, parser):
        parser.add_argument('--output', required=True)

    def handle(self, *args, **options):
        posts = list(BlogPost.objects.filter(is_published=True).values(
            'slug', 'title', 'excerpt', 'content', 'category', 'cover_image',
            'published_at', 'updated_at',
        ))
        for post in posts:
            for field in ('published_at', 'updated_at'):
                post[field] = post[field].isoformat()
        output = Path(options['output'])
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        self.stdout.write(self.style.SUCCESS(f'Exported {len(posts)} published articles.'))
