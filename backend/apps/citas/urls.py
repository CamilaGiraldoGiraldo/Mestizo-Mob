from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CitaCreateView, CitaViewSet, buscar_usuario

router = DefaultRouter()
router.register(r'lista', CitaViewSet, basename='cita')

urlpatterns = [
    path('crear/', CitaCreateView.as_view(), name='cita-create'),
    path('buscar-usuario/', buscar_usuario, name='buscar-usuario'),
    path('', include(router.urls)),
]