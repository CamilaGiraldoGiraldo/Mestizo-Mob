from rest_framework import serializers
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'identificacion',
            'nombre',
            'primerApellido',
            'segundoApellido',
            'correo',
            'telefono',
            'is_staff',
            'is_superuser',
            'is_active',
        ]
        read_only_fields = ['is_staff', 'is_superuser']