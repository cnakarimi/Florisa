from django.http import JsonResponse


def csrf_failure(request, reason="") -> JsonResponse:
    return JsonResponse(
        {"detail": "اعتبار امنیتی درخواست نامعتبر است."},
        status=403,
    )
