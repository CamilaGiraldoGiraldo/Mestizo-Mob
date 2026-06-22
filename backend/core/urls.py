from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from apps.productos.views import ProductoViewSet, ImagenDimensionViewSet
from apps.categorias.views import CategoriaViewSet
from apps.colores.views import ColorProductoViewSet
from apps.imagenProducto.views import ImagenProductoViewSet
from apps.citas.views import CitaViewSet
from apps.usuario.api.views import UsuarioViewSet
from apps.pedido.views import (
    PedidoCreateView,
    PedidoListView,
    PedidoDetailView,
    actualizar_estado_pedido,
    wompi_firma,
)
from apps.envio.views import EnvioCreateView

router = DefaultRouter()
router.register(r'productos',       ProductoViewSet,        basename='producto')
router.register(r'categorias',      CategoriaViewSet,       basename='categoria')
router.register(r'colores',         ColorProductoViewSet,   basename='color')
router.register(r'imagenproducto',  ImagenProductoViewSet,  basename='imagenproducto')
router.register(r'imagendimension', ImagenDimensionViewSet, basename='imagendimension')
router.register(r'usuarios',        UsuarioViewSet,         basename='usuario')

urlpatterns = [
    path('admin/',                       admin.site.urls),
    path('api/',                         include(router.urls)),
    path('usuario/',                     include('apps.usuario.api.urls')),
    path('api/citas/',                   include('apps.citas.urls')),

    # Pedidos — orden importante: rutas específicas antes que las genéricas
    path('api/pedidos/lista/',           PedidoListView.as_view(),      name='pedido-list'),
    path('api/pedidos/wompi/firma/',     wompi_firma,                   name='wompi-firma'),   # ← nueva
    path('api/pedidos/<int:pk>/estado/', actualizar_estado_pedido,      name='pedido-estado'),
    path('api/pedidos/<int:pk>/',        PedidoDetailView.as_view(),    name='pedido-detail'),
    path('api/pedidos/',                 PedidoCreateView.as_view(),    name='pedido-create'),

    path('api/envios/',                  EnvioCreateView.as_view(),     name='envio-create'),

    path('api/schema/',                  SpectacularAPIView.as_view(),                      name='schema'),
    path('api/docs/swagger/',            SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/docs/redoc/',              SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)