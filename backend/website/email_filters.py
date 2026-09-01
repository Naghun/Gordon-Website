from django.db.models import Q


def suspected_sales_or_scam_q():
    """Conservative markers for unsolicited sales mail; messages remain stored."""
    return (
        Q(body_text__icontains="white-label")
        | Q(body_text__icontains="website audit")
        | Q(body_text__icontains="development partner")
        | Q(body_text__icontains="additional development capacity")
        | Q(body_text__icontains="woocommerce tasks")
        | Q(body_text__icontains="woocommerce store ready")
        | Q(body_text__icontains="flexible wooCommerce development")
        | Q(body_text__icontains="without adding another full-time")
        | (Q(body_text__icontains="do you have any") & Q(body_text__icontains="tasks currently"))
        | Q(subject__icontains="seo service")
        | Q(subject__icontains="website development offer")
        | Q(subject__icontains="business proposal")
        | Q(subject__icontains="website redesign proposal")
        | Q(subject__icontains="ai-powered development")
        | Q(subject__icontains="woocommerce store ready")
        | Q(sender_email__iendswith="@workflowservicegroup.com")
        | Q(sender_email__iendswith="@myworkflowteam.com")
        | Q(sender_email__iendswith="@dmfpresales.com")
        | Q(sender_email__iendswith="@cssplayer.com")
    )
