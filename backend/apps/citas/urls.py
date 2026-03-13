from django.urls import path
from .views import CitaCreateView, buscar_usuario

urlpatterns = [

    path('', CitaCreateView.as_view(), name='crear-cita'),

    path('buscar-usuario/', buscar_usuario, name='buscar-usuario'),

]