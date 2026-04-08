from django.urls import path
from .views import (
    PedidoCreateView,
    PedidoListView,
    actualizar_estado_pedido,
    generar_firma_wompi,
    confirmar_pago
)

urlpatterns = [
    path('', PedidoCreateView.as_view(), name='pedido-create'),
    path('lista/', PedidoListView.as_view(), name='pedido-list'),
    path('<int:pk>/estado/', actualizar_estado_pedido, name='pedido-estado'),

    path('wompi/firma/', generar_firma_wompi, name='wompi-firma'),
    path('wompi/confirmar/', confirmar_pago, name='wompi-confirmar'),
]