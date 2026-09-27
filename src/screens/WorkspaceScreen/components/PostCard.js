import { Text, View } from 'react-native';
import { Action, s } from '../../../components/MobileUI';
import { POST_TYPES, STATUSES } from '../../../services/workspaceService';
import { activityDate } from '../../HomeScreen/homeData';
export default function PostCard({
  post,
  busy,
  canManage,
  onLike,
  onPin,
  onDelete,
  onThread,
  onLinked
}) {
  return <View style={[s.panel, post.pinned && {
    borderColor: '#B5D3F9'
  }]}>{post.pinned && <Text style={s.eyebrow}>PUBLICAÇÃO FIXADA</Text>}<View style={s.row}><View style={{
        width: 42,
        height: 42,
        borderRadius: 42,
        backgroundColor: '#EDF4FC',
        alignItems: 'center',
        justifyContent: 'center'
      }}><Text style={s.strong}>{post.author.slice(0, 1).toUpperCase()}</Text></View><View style={s.grow}><Text style={s.strong}>{post.author}</Text><Text style={s.meta}>{activityDate(post.date)}</Text></View></View><View style={s.wrap}><Text style={[s.eyebrow, s.pill]}>{POST_TYPES[post.type]}</Text>{post.status && <Text style={[s.meta, s.pill]}>{STATUSES[post.status]}</Text>}</View><Text style={s.body}>{post.content}</Text>{post.tags.length > 0 && <Text style={s.meta}>{post.tags.map(t => '#' + t).join(' ')}</Text>}{post.linkedType && <Action secondary title={post.linkedTitle || 'Ver conteúdo vinculado'} icon="link-outline" onPress={onLinked} />}{!!post.responsible && <Text style={s.meta}>Responsável: {post.responsible}</Text>}<View style={s.wrap}><Action secondary compact title={(post.liked ? 'Curtido' : 'Curtir') + ' · ' + post.likes} icon={post.liked ? 'heart' : 'heart-outline'} disabled={busy} onPress={onLike} /><Action secondary compact title={'Comentários · ' + post.comments.length} icon="chatbubble-outline" onPress={onThread} />{canManage && <><Action secondary compact title={post.pinned ? 'Desafixar' : 'Fixar'} disabled={busy} onPress={onPin} /><Action secondary compact danger title="Excluir" disabled={busy} onPress={onDelete} /></>}</View></View>;
}
