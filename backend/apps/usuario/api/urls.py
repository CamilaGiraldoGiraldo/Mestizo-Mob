from django.urls import path
from apps.usuario.api.api import usuario_api_view

urlpatterns = [
    path ('usuario/', usuario_api_view, name= "usuario_api")
]

