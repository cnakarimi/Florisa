from django.urls import path

from magazine.views import ArticleDetailView, ArticleListView, MagazineCategoryListView


app_name = "magazine"

urlpatterns = [
    path("categories/", MagazineCategoryListView.as_view(), name="category-list"),
    path("articles/", ArticleListView.as_view(), name="article-list"),
    path("articles/<slug:slug>/", ArticleDetailView.as_view(), name="article-detail"),
]
