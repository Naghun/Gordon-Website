import email
import imaplib
import re
import time
from html import unescape
from email.header import decode_header, make_header
from email.utils import parseaddr, parsedate_to_datetime

from django.conf import settings
from django.utils import timezone

from .models import AdminEmail
from .mail_accounts import accounts

_last_sync = {}


def _text(value):
    return str(make_header(decode_header(value or "")))


def _body(message):
    def decode_part(part):
        payload = part.get_payload(decode=True) or b""
        return payload.decode(part.get_content_charset() or "utf-8", errors="replace").strip()

    def html_to_text(value):
        value = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", value)
        value = re.sub(r"(?i)<br\s*/?>|</p>|</div>|</li>", "\n", value)
        value = re.sub(r"(?s)<[^>]+>", " ", value)
        value = unescape(value).replace("\xa0", " ")
        return re.sub(r"[ \t]+", " ", value).strip()

    if message.is_multipart():
        html_body = ""
        for part in message.walk():
            disposition = (part.get("Content-Disposition") or "").lower()
            if "attachment" in disposition:
                continue
            if part.get_content_type() == "text/plain":
                return decode_part(part)
            if part.get_content_type() == "text/html" and not html_body:
                html_body = html_to_text(decode_part(part))
        return html_body
    if message.get_content_type() == "text/plain":
        return decode_part(message)
    if message.get_content_type() == "text/html":
        return html_to_text(decode_part(message)
        )
    return ""


def sync_mailbox(force=False, limit=250, mailbox="primary"):
    config = accounts().get(mailbox)
    if not config: return {"ok":False,"error":"Nepoznat sandučić."}
    global _last_sync
    if not config["host"] or not config["user"] or not config["password"]:
        return {"ok": False, "error": "Email sandučić nije konfigurisan."}
    now = time.monotonic()
    if not force and now - _last_sync.get(mailbox,0) < 45:
        return {"ok": True, "skipped": True}
    _last_sync[mailbox] = now
    client = None
    try:
        client_class = imaplib.IMAP4_SSL if config["ssl"] else imaplib.IMAP4
        client = client_class(config["host"], config["port"], timeout=20)
        client.login(config["user"], config["password"])
        client.select("INBOX", readonly=True)
        status, data = client.uid("search", None, "ALL")
        if status != "OK":
            raise RuntimeError("Inbox nije dostupan.")
        uids = data[0].split()[-limit:]
        created = 0
        for raw_uid in uids:
            uid = raw_uid.decode()
            if AdminEmail.objects.filter(mailbox=mailbox,uid=uid).exists():
                continue
            status, payload = client.uid("fetch", raw_uid, "(RFC822)")
            if status != "OK" or not payload or not isinstance(payload[0], tuple):
                continue
            message = email.message_from_bytes(payload[0][1])
            sender_name, sender_email = parseaddr(_text(message.get("From")))
            received = parsedate_to_datetime(message.get("Date")) if message.get("Date") else timezone.now()
            if timezone.is_naive(received):
                received = timezone.make_aware(received)
            AdminEmail.objects.create(
                uid=uid,
                mailbox=mailbox,
                message_id=message.get("Message-ID", "")[:255],
                sender_name=sender_name[:180],
                sender_email=sender_email,
                recipient=_text(message.get("To"))[:255],
                subject=_text(message.get("Subject"))[:300],
                body_text=_body(message),
                received_at=received,
            )
            created += 1
        client.logout()
        client = None
        return {"ok": True, "created": created}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}

    finally:
        if client:
            try: client.logout()
            except Exception: pass
