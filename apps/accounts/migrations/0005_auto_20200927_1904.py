# Generated by Django 2.2.13 on 2020-09-27 23:04

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_auto_20200927_1856'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='_supervisors',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(), blank=True, default=list, size=None, verbose_name='Supervisors'),
        ),
        migrations.AlterField(
            model_name='user',
            name='first_name',
            field=models.CharField(blank=True, default='', max_length=32, verbose_name='first_name'),
        ),
        migrations.AlterField(
            model_name='user',
            name='last_name',
            field=models.CharField(blank=True, default='', max_length=32, verbose_name='last_name'),
        ),
    ]
