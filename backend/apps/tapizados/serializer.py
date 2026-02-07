from rest_framework import serializers
from .models import tapizados

class envioSerializer(serializers.ModelSerializer):
    class Meta:
        model = tapizados
        fields = '__all__'
