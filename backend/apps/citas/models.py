from django.db import models

class Cita(models.Model):
    # Usamos 'usuario.Usuario' — app_label.ModelName
    usuario = models.ForeignKey('usuario.Usuario', on_delete=models.CASCADE)
    fecha = models.DateField()
    hora = models.TimeField()
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.usuario.nombre} {self.usuario.primerApellido} - {self.fecha} {self.hora}"

    class Meta:
        verbose_name = "Cita"
        verbose_name_plural = "Citas"
        ordering = ['fecha', 'hora']