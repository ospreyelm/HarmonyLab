from django_tables2 import tables, A

from apps.exercises.models import Playlist


class CoursePageTable(tables.Table):
    name = tables.columns.LinkColumn(
        # attrs={"td": {"bgcolor": "white", "width": "auto"}},
        viewname='lab:playlist-view',
        kwargs={'playlist_name': A('name')},
        verbose_name='Unit'
    )

    class Meta:
        model = Playlist
        attrs = {"class": "paleblue"}
        fields = ('name', 'id', 'authored_by')
