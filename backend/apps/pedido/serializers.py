from rest_framework import serializers
from .models import Pedido, PedidoItem


class PedidoItemSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = PedidoItem
        fields = ['id', 'producto', 'producto_nombre', 'cantidad']


class PedidoSerializer(serializers.ModelSerializer):
    items = PedidoItemSerializer(many=True)

    # Datos del usuario para mostrar en el panel
    usuario_nombre          = serializers.CharField(source='usuario.nombre',          read_only=True)
    usuario_primer_apellido = serializers.CharField(source='usuario.primerApellido',  read_only=True)
    usuario_correo          = serializers.CharField(source='usuario.correo',           read_only=True)
    usuario_telefono        = serializers.CharField(source='usuario.telefono',         read_only=True)
    usuario_identificacion  = serializers.CharField(source='usuario.identificacion',   read_only=True)

    # Datos del envío (si existe)
    direccion     = serializers.CharField(source='envio.direccion',     read_only=True, default=None)
    ciudad        = serializers.CharField(source='envio.ciudad',        read_only=True, default=None)
    departamento  = serializers.CharField(source='envio.estado',        read_only=True, default=None)
    codigo_postal = serializers.CharField(source='envio.codigo_postal', read_only=True, default=None)

    class Meta:
        model  = Pedido
        fields = [
            'id', 'fecha', 'total', 'estado',
            'usuario_identificacion', 'usuario_nombre', 'usuario_primer_apellido',
            'usuario_correo', 'usuario_telefono',
            'direccion', 'ciudad', 'departamento', 'codigo_postal',
            'items',
        ]
        read_only_fields = ['id', 'fecha']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        pedido = Pedido.objects.create(**validated_data)
        for item in items_data:
            PedidoItem.objects.create(pedido=pedido, **item)
        return pedido