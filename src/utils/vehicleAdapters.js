function firstSource(field) {
  const sources = field?.Fontes || field?.fontes || [];
  return Array.isArray(sources) ? sources[0] : sources;
}
export function unwrapField(field, suffix = '') {
  if (field == null) return { value: 'Não informado', source: null, confidence: 0, conflict: false };
  if (typeof field === 'string' || typeof field === 'number') return { value: `${field}${suffix}`, source: null, confidence: 100, conflict: false };
  const source = firstSource(field);
  const raw = source?.Valor ?? source?.valor ?? field?.Valor ?? field?.valor;
  const value = raw == null || raw === '' ? 'Não informado' : `${Array.isArray(raw) ? raw.join(', ') : raw}${suffix}`;
  const confidence = Math.round(Number(field?.Confianca ?? field?.confianca ?? source?.Confianca ?? source?.confianca ?? 0) * 100);
  return { value, source: source?.Fonte ?? source?.fonte ?? null, confidence, conflict: Boolean(field?.Conflito ?? field?.conflito) };
}
export function adaptCarCard(dto) {
  const specs = dto?.especificacoes?.[0] || dto?.Especificacoes?.[0] || {};
  return {
    id: String(dto?.linhagemId ?? dto?.LinhagemId ?? dto?.id ?? dto?.Id),
    brand: dto?.marca ?? dto?.Marca ?? '',
    model: dto?.modelo ?? dto?.Modelo ?? '',
    year: dto?.ano ?? dto?.Ano ?? '',
    name: `${dto?.modelo ?? dto?.Modelo ?? ''} ${dto?.ano ?? dto?.Ano ?? ''}`.trim(),
    image: dto?.imagemUrl ?? dto?.ImagemUrl ?? null,
    engine: unwrapField(specs.motor || specs.Motor).value,
    power: unwrapField(specs.potencia || specs.Potencia, ' cv').value,
    type: unwrapField(dto?.categoria || dto?.Categoria).value,
    raw: dto,
  };
}
export function adaptCarDetail(dto) {
  const specs = dto?.especificacoes?.[0] || {};
  const consumption = dto?.consumos?.[0] || {};
  const dimensions = dto?.dimensoes?.[0] || {};
  const fields = {
    motor: unwrapField(specs.motor), potencia: unwrapField(specs.potencia, ' cv'), torque: unwrapField(specs.torque, ' kgfm'),
    transmissao: unwrapField(specs.transmissao), tracao: unwrapField(specs.tracao),
    cidade: unwrapField(consumption.cidade, ' km/l'), estrada: unwrapField(consumption.estrada, ' km/l'),
    comprimento: unwrapField(dimensions.comprimento, ' m'), largura: unwrapField(dimensions.largura, ' m'), altura: unwrapField(dimensions.altura, ' m'), entreEixos: unwrapField(dimensions.entreEixos, ' m'),
    categoria: unwrapField(dto?.categoria),
  };
  const confidences = Object.values(fields).map((f) => f.confidence).filter((v) => v > 0);
  const averageConfidence = confidences.length ? Math.round(confidences.reduce((a,b)=>a+b,0)/confidences.length) : 0;
  return { ...adaptCarCard(dto), description: dto?.descricao || 'Dados técnicos detalhados extraídos da base do BCI.', fields, averageConfidence, isFuture: Number(dto?.ano) > new Date().getFullYear(), raw: dto };
}

export function adaptComparisonCar(dto) {
  if (!dto) return null;
  const specs = dto.especificacoes?.[0] || dto.specs || {};
  const consumption = dto.consumos?.[0] || {};
  const dimensions = dto.dimensoes?.[0] || {};
  return {
    id: String(dto.id ?? dto.linhagemId),
    brand: dto.marca || dto.brand || '',
    name: dto.name || `${dto.marca || ''} ${dto.modelo || ''} ${dto.ano || ''}`.trim(),
    image: dto.imagemUrl || dto.image || null,
    specs: {
      Motor: unwrapField(specs.motor || specs.engine).value,
      Potência: unwrapField(specs.potencia || specs.power, ' cv').value,
      Torque: unwrapField(specs.torque, ' kgfm').value,
      Transmissão: unwrapField(specs.transmissao || specs.transmission).value,
      Tração: unwrapField(specs.tracao || specs.drivetrain).value,
      'Consumo cidade': unwrapField(consumption.cidade, ' km/l').value,
      'Consumo estrada': unwrapField(consumption.estrada, ' km/l').value,
      Comprimento: unwrapField(dimensions.comprimento, ' m').value,
      Largura: unwrapField(dimensions.largura, ' m').value,
      Altura: unwrapField(dimensions.altura, ' m').value,
    },
    raw: dto,
  };
}
