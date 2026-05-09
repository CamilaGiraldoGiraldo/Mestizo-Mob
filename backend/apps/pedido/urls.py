from django.urls import path
from .views import PedidoCreateView, PedidoListView, actualizar_estado_pedido

urlpatterns = [
    path('',              PedidoCreateView.as_view(),    name='pedido-create'),
    path('lista/',        PedidoListView.as_view(),       name='pedido-list'),
    path('<int:pk>/estado/', actualizar_estado_pedido,    name='pedido-estado'),
]