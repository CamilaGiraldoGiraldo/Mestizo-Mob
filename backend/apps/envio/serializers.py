from rest_framework import serializers
from .models import Envio


class EnvioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Envio
        fields = ['id', 'pedido', 'direccion', 'ciudad', 'estado', 'codigo_postal', 'entregado']
        read_only_fields = ['id', 'entregado']