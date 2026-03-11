
# apps/citas/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.CitaCreateView.as_view(), name='citas-create'),
]