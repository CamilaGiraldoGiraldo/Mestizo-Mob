from django.db import models
from django.conf import settings
from apps.productos.models import Producto


class Pedido(models.Model):

    ESTADO_CHOICES = [
        ('pendiente',       'Pendiente'),
        ('confirmado',      'Confirmado'),
        ('en_preparacion',  'En preparación'),
        ('enviado',         'Enviado'),
        ('entregado',       'Entregado'),
        ('cancelado',       'Cancelado'),
    ]

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fecha   = models.DateTimeField(auto_now_add=True)
    total   = models.DecimalField(max_digits=10, decimal_places=2)
    estado  = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')

    # 🔥 NUEVO (pagos)
    estado_pago = models.CharField(max_length=20, default='pendiente')
    referencia_pago = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Pedido {self.id} - {self.usuario}"


class PedidoItem(models.Model):
    pedido   = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre}"