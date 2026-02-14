from django.contrib.auth.models import  AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from django.utils import timezone

class ManageUsuario(BaseUserManager):
    def create_user(self, identificacion, nombre, primerApellido, segundoApellido, correo, telefono, password, direccion, **krows):
        usuario = self.model(
            identificacion = identificacion,
            nombre = nombre,
            primerApellido = primerApellido,
            segundoApellido = segundoApellido,
            telefono = telefono,
            direccion = direccion,
            is_staff = False,
            is_superuser = False,
            is_active = True,
            date_joined = timezone.now(),
            **krows
        )
        usuario.set_password(password)
        usuario.correo = self.normalize_email(correo)
        usuario.save(using = self._db);
        return usuario;

     
    def create_superuser(self, identificacion, nombre, primerApellido, segundoApellido, correo, telefono, password, direccion, **krows):
        usuario = self.model(
            identificacion = identificacion,
            nombre = nombre,
            primerApellido = primerApellido,
            segundoApellido = segundoApellido,
            telefono = telefono,
            direccion = direccion,
            is_staff = True,
            is_superuser = True,
            is_active = True,
            date_joined = timezone.now(),
            **krows
        )
        usuario.set_password(password)
        usuario.correo = self.normalize_email(correo)
        usuario.save(using = self._db);
        return usuario;


class Usuario(AbstractBaseUser, PermissionsMixin):
    identificacion = models.CharField(primary_key= True, max_length=12, unique= True)
    nombre = models.CharField(max_length= 50)
    primerApellido = models.CharField( max_length=40)
    segundoApellido= models.CharField(max_length= 40)
    correo = models.EmailField( unique= True)
    telefono = models.CharField(max_length= 10)
    direccion = models.TextField()
    is_active= models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default= timezone.now)


    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = ['identificacion','nombre', 'primerApellido', 'segundoApellido', 'telefono', 'direccion']

    objects = ManageUsuario()

    def __str__(self):
        return self.nombre + " "+ self.primerApellido

