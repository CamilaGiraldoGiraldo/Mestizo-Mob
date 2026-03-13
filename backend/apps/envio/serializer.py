from rest_framework import serializers
from .models import Envio  # ← E mayúscula
 
class EnvioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Envio  # ← E mayúscula
        fields = '__all__'
 