from rest_framework import serializers
from .models import Pedido, PedidoItem  # ← P mayúscula
 
class PedidoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PedidoItem
        fields = '__all__'
 
class PedidoSerializer(serializers.ModelSerializer):
    items = PedidoItemSerializer(many=True, read_only=True)
 
    class Meta:
        model = Pedido  # ← P mayúscula
        fields = '__all__'
 