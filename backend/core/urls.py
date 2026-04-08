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

# 🔥 IMPORTANTE: pedidos + wompi
from apps.pedido.views import (
    PedidoCreateView,
    PedidoListView,
    PedidoDetailView,
    actualizar_estado_pedido,
    generar_firma_wompi,
    confirmar_pago
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
    path('admin/', admin.site.urls),

    # API base
    path('api/', include(router.urls)),

    # Usuario
    path('usuario/', include('apps.usuario.api.urls')),

    # Citas
    path('api/citas/', include('apps.citas.urls')),

    # =========================
    # 🧾 PEDIDOS
    # =========================
    path('api/pedidos/lista/',           PedidoListView.as_view(),      name='pedido-list'),
    path('api/pedidos/<int:pk>/estado/', actualizar_estado_pedido,      name='pedido-estado'),
    path('api/pedidos/<int:pk>/',        PedidoDetailView.as_view(),    name='pedido-detail'),
    path('api/pedidos/',                 PedidoCreateView.as_view(),    name='pedido-create'),

    # =========================
    # 💳 WOMPI
    # =========================
    path('api/pedidos/wompi/firma/',     generar_firma_wompi,           name='wompi-firma'),
    path('api/pedidos/wompi/confirmar/', confirmar_pago,                name='wompi-confirmar'),

    # =========================
    # 🚚 ENVÍOS
    # =========================
    path('api/envios/', EnvioCreateView.as_view(), name='envio-create'),

    # =========================
    # 📄 DOCUMENTACIÓN API
    # =========================
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]


# MEDIA (solo desarrollo)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)