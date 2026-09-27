import FormField from '../../components/FormField';
export default function SearchField({ label, style, ...props }) {
  return <FormField label={label} style={style} {...props}/>;
}
