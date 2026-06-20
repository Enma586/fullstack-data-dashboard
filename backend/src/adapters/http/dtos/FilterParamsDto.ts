/**
 * DTO que encapsula y valida los parámetros de filtro provenientes de la
 * cadena de consulta HTTP. Soporta from, to, customer_state, order_status y category.
 */
export class FilterParamsDto {
  public readonly from?: Date;
  public readonly to?: Date;
  public readonly customerState?: string;
  public readonly orderStatus?: string;
  public readonly category?: string;

  protected constructor(params: Record<string, string | undefined>) {
    const from = params.from ?? params["from"];
    const to = params.to ?? params["to"];
    const customerState = params.customer_state ?? params.customerState;
    const orderStatus = params.order_status ?? params.orderStatus;
    const category = params.category ?? params.category;

    if (from) {
      const d = new Date(from);
      if (isNaN(d.getTime())) {
        throw new Error("Parametro invalido: from debe ser una fecha YYYY-MM-DD");
      }
      this.from = d;
    }

    if (to) {
      const d = new Date(to);
      if (isNaN(d.getTime())) {
        throw new Error("Parametro invalido: to debe ser una fecha YYYY-MM-DD");
      }
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      this.to = nextDay;
    }

    if (customerState) {
      if (!/^[A-Z]{2}$/.test(customerState.toUpperCase())) {
        throw new Error(
          "Parametro invalido: customer_state debe ser un codigo de estado de 2 letras (ej. SP)",
        );
      }
      this.customerState = customerState.toUpperCase();
    }

    if (orderStatus) {
      const valid = ["delivered", "shipped", "processing", "canceled", "invoiced", "unavailable", "approved", "created"];
      const normalized = orderStatus.toLowerCase();
      if (!valid.includes(normalized)) {
        throw new Error(
          `Parametro invalido: order_status debe ser uno de: ${valid.join(", ")}`,
        );
      }
      this.orderStatus = normalized;
    }

    if (category) {
      this.category = category;
    }
  }

  static fromQuery(
    query: Record<string, string | undefined>,
  ): FilterParamsDto {
    return new FilterParamsDto(query);
  }

  toFilters() {
    return {
      from: this.from,
      to: this.to,
      customerState: this.customerState,
      orderStatus: this.orderStatus,
      category: this.category,
    };
  }
}
