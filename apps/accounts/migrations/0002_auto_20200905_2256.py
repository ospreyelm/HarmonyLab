# Generated by Django 2.2.13 on 2020-09-06 02:56

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'ordering': ('-date_joined',), 'verbose_name': 'User', 'verbose_name_plural': 'Users'},
        ),
    ]
