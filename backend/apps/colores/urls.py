# apps/colorProducto/urls.py

from rest_framework.routers import DefaultRouter
from .views import ColorProductoViewSet

router = DefaultRouter()
router.register(r'colores', ColorProductoViewSet, basename='colores')

urlpatterns = router.urls