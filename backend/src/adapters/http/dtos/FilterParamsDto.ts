/**
 * DTOs para parámetros de filtro de consultas HTTP.
 * @module dtos/FilterParamsDto
 */

/**
 * DTO que encapsula y valida los parámetros de filtro provenientes de la
 * cadena de consulta HTTP. Soporta los parámetros from, to, customer_state
 * y payment_type.
 */
export class FilterParamsDto {
  /** Fecha de inicio del filtro (opcional). */
  public readonly from?: Date;

  /** Fecha de fin del filtro (opcional, se ajusta al día siguiente). */
  public readonly to?: Date;

  /** Código de estado del cliente de dos letras (opcional, ej. SP). */
  public readonly customerState?: string;

  /** Tipo de pago normalizado (opcional, ej. credit_card). */
  public readonly paymentType?: string;

  /**
   * Construye el DTO a partir de un conjunto de parámetros planos. Realiza
   * validación de fechas, código de estado y tipo de pago.
   * @param params - Objeto con los parámetros de consulta.
   * @throws Error si algún parámetro tiene un formato inválido.
   */
  protected constructor(params: Record<string, string | undefined>) {
    const from = params.from ?? params['from'];
    const to = params.to ?? params['to'];
    const customerState = params.customer_state ?? params.customerState;
    const paymentType = params.payment_type ?? params.paymentType;

    if (from) {
      const d = new Date(from);
      if (isNaN(d.getTime())) {
        throw new Error('Parametro invalido: from debe ser una fecha YYYY-MM-DD');
      }
      this.from = d;
    }

    if (to) {
      const d = new Date(to);
      if (isNaN(d.getTime())) {
        throw new Error('Parametro invalido: to debe ser una fecha YYYY-MM-DD');
      }
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      this.to = nextDay;
    }

    if (customerState) {
      if (!/^[A-Z]{2}$/.test(customerState.toUpperCase())) {
        throw new Error(
          'Parametro invalido: customer_state debe ser un codigo de estado de 2 letras (ej. SP)',
        );
      }
      this.customerState = customerState.toUpperCase();
    }

    if (paymentType) {
      const validTypes = ['credit_card', 'boleto', 'voucher', 'debit_card'];
      const normalized = paymentType.toLowerCase();
      if (!validTypes.includes(normalized)) {
        throw new Error(
          `Parametro invalido: payment_type debe ser uno de: ${validTypes.join(', ')}`,
        );
      }
      this.paymentType = normalized;
    }
  }

  /**
   * Crea una instancia de FilterParamsDto desde los parámetros de consulta.
   * @param query - Objeto con los parámetros de la cadena de consulta.
   * @returns Una nueva instancia de FilterParamsDto.
   */
  static fromQuery(
    query: Record<string, string | undefined>,
  ): FilterParamsDto {
    return new FilterParamsDto(query);
  }

  /**
   * Convierte el DTO a un objeto plano de filtros.
   * @returns Objeto con las propiedades from, to, customerState y paymentType.
   */
  toFilters() {
    return {
      from: this.from,
      to: this.to,
      customerState: this.customerState,
      paymentType: this.paymentType,
    };
  }
}
