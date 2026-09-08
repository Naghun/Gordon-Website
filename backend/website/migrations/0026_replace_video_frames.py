import json
from pathlib import Path
from django.db import migrations

def update(apps, schema_editor):
    Post=apps.get_model('website','BlogPost')
    Image=apps.get_model('website','BlogPostImage')
    alias=schema_editor.connection.alias
    posts=json.loads((Path(__file__).resolve().parent.parent/'data/instagram-batch-02.json').read_text(encoding='utf-8'))
    for p in posts:
        if not p.get('video_url'):
            continue
        post=Post.objects.using(alias).filter(slug=p['slug']).first()
        if not post:
            continue
        Post.objects.using(alias).filter(pk=post.pk).update(cover_image=p['cover_image'],video_url=p['video_url'],content=p['content'])
        # Only remove the previously imported frame gallery; preserve media files.
        Image.objects.using(alias).filter(post_id=post.pk,image__startswith=f"blog/instagram/{p['slug']}/").delete()

class Migration(migrations.Migration):
    dependencies=[('website','0025_publish_approved_instagram')]
    operations=[migrations.RunPython(update,migrations.RunPython.noop)]
