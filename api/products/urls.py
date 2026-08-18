from django.urls import path

from products.views import (
    CategoryListView,
    HomeSlideListView,
    ProductDetailView,
    ProductListView,
)


app_name = "products"

urlpatterns = [
    path("home/slides/", HomeSlideListView.as_view(), name="home-slide-list"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path(
        "products/<slug:slug>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),
]
