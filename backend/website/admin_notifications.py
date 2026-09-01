from django.contrib import admin
from django.db.models import F, OuterRef, Q, Subquery
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone

from .mailbox import sync_mailbox
from .models import AdminEmail, ChatConversation, ChatMessage, ContactMessage
from .email_filters import suspected_sales_or_scam_q


def email_preview(message):
    value = (message.body_text or "").strip()
    if value.startswith("PK") or value.count("�") > 3:
        return "Automatski izvještaj sadrži XML/ZIP prilog."
    return value[:180] or "Email nema tekstualni sadržaj; provjerite priloženu datoteku."


def unread_chats():
    latest = ChatMessage.objects.filter(conversation=OuterRef("pk")).order_by("-created_at")
    return (
        ChatConversation.objects.annotate(
            latest_sender=Subquery(latest.values("sender")[:1]),
            latest_text=Subquery(latest.values("message")[:1]),
            latest_created=Subquery(latest.values("created_at")[:1]),
        )
        .filter(latest_sender=ChatMessage.VISITOR, is_closed=False)
        .filter(Q(admin_seen_at__isnull=True) | Q(latest_created__gt=F("admin_seen_at")))
    )


def unread_notification_counts():
    counts = {
        "chat": unread_chats().count(),
        "contact": ContactMessage.objects.filter(is_read=False).count(),
        "email": AdminEmail.objects.filter(is_read=False).exclude(suspected_sales_or_scam_q()).count(),
    }
    counts["total"] = sum(counts.values())
    return counts


def notification_items(limit=40, kind=None):
    contact_items = [
        {
            "kind": "contact",
            "title": "Novi kontakt upit",
            "person": message.name,
            "preview": message.message[:150],
            "created_at": message.created_at,
            "url": reverse("admin_notification_open", args=("contact", message.pk)),
        }
        for message in ContactMessage.objects.filter(is_read=False)[:limit]
    ]
    chat_items = [
        {
            "kind": "chat",
            "title": "Nova chat poruka",
            "person": conversation.name,
            "preview": conversation.latest_text[:150],
            "created_at": conversation.latest_created,
            "url": reverse("admin_notification_open", args=("chat", conversation.pk)),
        }
        for conversation in unread_chats()[:limit]
    ]
    email_items = [
        {
            "kind": "email",
            "title": message.subject or "Novi email",
            "person": message.sender_name or message.sender_email,
            "preview": email_preview(message),
            "created_at": message.received_at,
            "url": reverse("admin_notification_open", args=("email", message.pk)),
        }
        for message in AdminEmail.objects.filter(is_read=False).exclude(suspected_sales_or_scam_q())[:limit]
    ]
    if kind == "contact":
        items = contact_items
    elif kind == "chat":
        items = chat_items
    elif kind == "email":
        items = email_items
    else:
        items = contact_items + chat_items + email_items
    return sorted(items, key=lambda item: item["created_at"], reverse=True)[:limit]


@admin.site.admin_view
def notifications_page(request):
    sync_result = sync_mailbox(force=True)
    active_type = request.POST.get("type") or request.GET.get("type", "chat")
    if active_type not in {"chat", "contact", "email"}:
        active_type = "chat"
    if request.method == "POST" and request.POST.get("action") == "read_all_emails":
        AdminEmail.objects.filter(is_read=False).exclude(suspected_sales_or_scam_q()).update(is_read=True)
        return redirect(f'{reverse("admin_notifications")}?type=email')
    items = notification_items(40, active_type)
    counts = unread_notification_counts()
    sync_error = sync_result.get("error", "")
    if sync_result.get("ok"):
        sync_warning = ""
    elif "10013" in sync_error or "socket" in sync_error.lower():
        sync_warning = "Mrežni pristup email serveru je blokiran. Pokrenite backend s dozvolom za mrežni pristup i pokušajte ponovo."
    else:
        sync_warning = "Email sandučić nije dostupan. Provjerite IMAP server i pristupne podatke."
    return render(request, "admin/notifications.html", {
        "title": "Notifikacije",
        "notifications": items,
        "notification_count": counts["total"],
        "active_type": active_type,
        "notification_counts": counts,
        "mail_sync_error": sync_warning,
    })


@admin.site.admin_view
def notifications_feed(request):
    sync_mailbox()
    items = notification_items(20)
    counts = unread_notification_counts()
    return JsonResponse({
        "count": counts["total"],
        "counts": counts,
        "items": [
            {
                "kind": item["kind"],
                "title": item["title"],
                "person": item["person"],
                "preview": item["preview"],
                "url": item["url"],
                "created_at": item["created_at"].isoformat(),
            }
            for item in items
        ],
    })


@admin.site.admin_view
def notification_open(request, kind, object_id):
    if kind == "contact":
        item = get_object_or_404(ContactMessage, pk=object_id)
        if not item.is_read:
            item.is_read = True
            item.save(update_fields=["is_read"])
        return redirect(reverse("admin:website_contactmessage_change", args=(item.pk,)))
    if kind == "chat":
        conversation = get_object_or_404(ChatConversation, pk=object_id)
        conversation.admin_seen_at = timezone.now()
        conversation.save(update_fields=["admin_seen_at"])
        return redirect(reverse("admin:website_chatconversation_change", args=(conversation.pk,)))
    if kind == "email":
        message = get_object_or_404(AdminEmail, pk=object_id)
        if not message.is_read:
            message.is_read = True
            message.save(update_fields=["is_read"])
        return redirect(reverse("admin:website_adminemail_change", args=(message.pk,)))
    return redirect("admin_notifications")
