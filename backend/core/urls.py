from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from apps.productos.views import ProductoViewSet
from apps.categorias.views import CategoriaViewSet
from apps.colores.views import ColorProductoViewSet
from apps.imagenProducto.views import ImagenProductoViewSet

router = DefaultRouter()
router.register(r'productos',      ProductoViewSet,       basename='producto')
router.register(r'categorias',     CategoriaViewSet,      basename='categoria')
router.register(r'colores',        ColorProductoViewSet,  basename='color')
router.register(r'imagenproducto', ImagenProductoViewSet, basename='imagenproducto')

urlpatterns = [
    path('admin/',    admin.site.urls),
    path('api/',      include(router.urls)),
    path('usuario/',  include('apps.usuario.api.urls')),
    path('api/citas/', include('apps.citas.urls')),

    # Documentación
    path('api/schema/',         SpectacularAPIView.as_view(),                        name='schema'),
    path('api/docs/swagger/',   SpectacularSwaggerView.as_view(url_name='schema'),   name='swagger-ui'),
    path('api/docs/redoc/',     SpectacularRedocView.as_view(url_name='schema'),      name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)