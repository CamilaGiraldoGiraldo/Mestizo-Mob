from rest_framework import serializers
from .models import Cita


class CitaSerializer(serializers.ModelSerializer):

    identificacion = serializers.CharField(source="usuario.identificacion", read_only=True)
    nombre         = serializers.CharField(source="usuario.nombre",         read_only=True)
    primerApellido = serializers.CharField(source="usuario.primerApellido", read_only=True)
    correo         = serializers.EmailField(source="usuario.correo",        read_only=True)
    telefono       = serializers.CharField(source="usuario.telefono",       read_only=True)

    class Meta:
        model = Cita
        fields = [
            "id",
            "usuario",
            "identificacion",
            "nombre",
            "primerApellido",
            "correo",
            "telefono",
            "fecha",
            "hora",
            "descripcion",
            "estado",
        ]
        read_only_fields = ["usuario"]