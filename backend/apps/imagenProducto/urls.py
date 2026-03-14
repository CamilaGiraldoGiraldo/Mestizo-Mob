from rest_framework.routers import DefaultRouter
from .views import ImagenProductoViewSet

router = DefaultRouter()
router.register(r'imagenproducto', ImagenProductoViewSet)

urlpatterns = router.urls