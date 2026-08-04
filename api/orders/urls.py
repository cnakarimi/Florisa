from django.urls import path

from orders.views import (
    AddressDetailView,
    AddressListCreateView,
    CartPreviewView,
    OrderDetailView,
    OrderListCreateView,
)


app_name = "orders"

urlpatterns = [
    path("addresses/", AddressListCreateView.as_view(), name="address-list"),
    path("addresses/<int:pk>/", AddressDetailView.as_view(), name="address-detail"),
    path("orders/preview/", CartPreviewView.as_view(), name="order-preview"),
    path("orders/", OrderListCreateView.as_view(), name="order-list"),
    path("orders/<uuid:public_number>/", OrderDetailView.as_view(), name="order-detail"),
]
