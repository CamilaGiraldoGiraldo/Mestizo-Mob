from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    login_view,
    registro_view,
    enviar_codigo_view,
    resetear_contrasena_view,
    UsuarioViewSet,
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('auth/login/',               login_view,               name='login'),
    path('auth/registro/',            registro_view,            name='registro'),
    path('auth/enviar-codigo/',       enviar_codigo_view,       name='enviar-codigo'),
    path('auth/resetear-contrasena/', resetear_contrasena_view, name='resetear-contrasena'),
    path('', include(router.urls)),
]