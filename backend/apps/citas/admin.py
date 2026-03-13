from django.contrib import admin
from .models import Cita

@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'fecha', 'hora', 'estado', 'descripcion']
    list_filter = ['estado', 'fecha']
    search_fields = ['usuario__nombre', 'usuario__correo']
    ordering = ['fecha', 'hora']
    list_editable = ['estado']