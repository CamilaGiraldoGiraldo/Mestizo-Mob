from django.db import models


class Cita(models.Model):

    usuario = models.ForeignKey('usuario.Usuario', on_delete=models.CASCADE)

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