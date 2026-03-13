from django.db import models
from django.conf import settings


class Cita(models.Model):

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="citas"
    )

    fecha = models.DateField()
    hora = models.TimeField()

    descripcion = models.TextField()

    estado = models.CharField(
        max_length=20,
        default="pendiente"
    )

    def __str__(self):
        return f"{self.usuario.nombre} - {self.fecha} {self.hora}"

    class Meta:
        ordering = ["fecha", "hora"]