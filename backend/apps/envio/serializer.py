from rest_framework import serializers
from .models import envio

class envioSerializer(serializers.ModelSerializer):
    class Meta:
        model = envio
        fields = '__all__'
