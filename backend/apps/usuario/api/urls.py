from django.urls import path
from .views import login_view, enviar_codigo_view, resetear_contrasena_view

urlpatterns = [
    path('auth/login/',              login_view,              name='login'),
    path('auth/enviar-codigo/',      enviar_codigo_view,      name='enviar-codigo'),
    path('auth/resetear-contrasena/', resetear_contrasena_view, name='resetear-contrasena'),
]