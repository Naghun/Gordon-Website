from django.conf import settings
from django.core.mail import get_connection, send_mail

def accounts():
    return {
        'primary': {'label':settings.IMAP_USER or 'Postojeći email','host':settings.IMAP_HOST,'port':settings.IMAP_PORT,'user':settings.IMAP_USER,'password':settings.IMAP_PASSWORD,'ssl':settings.IMAP_USE_SSL},
        'contact': {'label':'kontakt@gordondm.com','host':'mail.gordondm.com','port':993,'user':'kontakt@gordondm.com','password':settings.CONTACT_MAIL_PASSWORD,'ssl':True},
    }

def send_from_mailbox(mailbox,subject,body,recipients):
    if mailbox=='contact':
        connection=get_connection(host='mail.gordondm.com',port=465,username='kontakt@gordondm.com',password=settings.CONTACT_MAIL_PASSWORD,use_ssl=True,use_tls=False,timeout=20)
        return send_mail(subject,body,'kontakt@gordondm.com',recipients,connection=connection,fail_silently=False)
    return send_mail(subject,body,None,recipients,fail_silently=False)
