from django.db import models
from apps.pedido.models import Pedido

class Envio(models.Model):
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE)
    direccion = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100)
    estado = models.CharField(max_length=100)
    codigo_postal = models.CharField(max_length=20)
    entregado = models.BooleanField(default=False)

    def __str__(self):
        return f"Envío del pedido {self.pedido.id}"
