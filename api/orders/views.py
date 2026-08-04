from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order, UserAddress
from orders.serializers import (
    CartPreviewRequestSerializer,
    CartPreviewResponseSerializer,
    OrderCreateRequestSerializer,
    OrderSerializer,
    UserAddressSerializer,
)
from orders.services import create_order, preview_cart


class AddressListCreateView(ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserAddressSerializer

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)


class AddressDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserAddressSerializer

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        was_default = instance.is_default
        user = instance.user
        instance.delete()
        if was_default:
            replacement = UserAddress.objects.filter(user=user).order_by("-updated_at").first()
            if replacement:
                replacement.is_default = True
                replacement.save(update_fields=("is_default", "updated_at"))


class CartPreviewView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(request=CartPreviewRequestSerializer, responses={200: CartPreviewResponseSerializer})
    def post(self, request):
        serializer = CartPreviewRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(preview_cart(user=request.user, items=serializer.validated_data["items"]))


class OrderListCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(responses={200: OrderSerializer(many=True)})
    def get(self, request):
        orders = (
            Order.objects.filter(user=request.user)
            .select_related("user")
            .prefetch_related("items")
        )
        return Response(OrderSerializer(orders, many=True).data)

    @extend_schema(request=OrderCreateRequestSerializer, responses={200: OrderSerializer, 201: OrderSerializer})
    def post(self, request):
        serializer = OrderCreateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order, created = create_order(user=request.user, **serializer.validated_data)
        order = Order.objects.prefetch_related("items").get(pk=order.pk)
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class OrderDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(responses={200: OrderSerializer})
    def get(self, request, public_number):
        try:
            order = (
                Order.objects.filter(user=request.user)
                .prefetch_related("items")
                .get(public_number=public_number)
            )
        except Order.DoesNotExist:
            raise NotFound("سفارش موردنظر پیدا نشد.")
        return Response(OrderSerializer(order).data)
