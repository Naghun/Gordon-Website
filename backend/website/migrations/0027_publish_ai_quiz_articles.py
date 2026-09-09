"""Publish approved articles without overwriting existing editorial content."""
import json
from pathlib import Path
from django.db import migrations


def publish(apps, schema_editor):
    Post = apps.get_model('website', 'BlogPost')
    Image = apps.get_model('website', 'BlogPostImage')
    SEO = apps.get_model('website', 'SEOPage')
    alias = schema_editor.connection.alias
    path = Path(__file__).resolve().parent.parent / 'data/instagram-batch-03.json'
    for p in json.loads(path.read_text(encoding='utf-8')):
        if Post.objects.using(alias).filter(slug=p['slug']).exists():
            continue
        images = [f"blog/instagram/{p['slug']}/{i+1:02d}.webp" for i in range(len(p['photos']))]
        post = Post.objects.using(alias).create(
            title=p['title'], slug=p['slug'], excerpt=p['excerpt'], content=p['content'],
            category=p['category'], location=p['location'], cover_logo='gordondm',
            cover_image=p.get('cover_image') or images[0], video_url=p.get('video_url', ''),
            is_published=True,
        )
        for i, image in enumerate(images):
            Image.objects.using(alias).create(post=post, image=image, caption=p['photo_captions'][i], order=i)
        SEO.objects.using(alias).get_or_create(route=f"/blog/{p['slug']}", defaults={
            'page_name': p['title'][:120], 'title_bs': p['title']+' | GordonDM',
            'description_bs': p['excerpt'], 'primary_keyword': p['primary_keyword'],
            'secondary_keywords': p['secondary_keywords'], 'search_intent': 'informational',
            'schema_type': 'WebPage', 'is_active': True, 'is_indexed': True,
            'canonical_url': f"https://gordon.ba/blog/{p['slug']}",
        })


class Migration(migrations.Migration):
    dependencies = [('website', '0026_replace_video_frames')]
    operations = [migrations.RunPython(publish, migrations.RunPython.noop)]
