import { isDefined } from "../../helper/utils";

Vue.component("order-property-value", {
    props:
    {
        template:
        {
            type: String,
            default: "#vue-order-property-value"
        },
        property:
        {
            type: Object,
            required: true
        }
    },

    computed:
    {
        valueLabel()
        {
            if (this.property.type === "selection")
            {
                const propertyId = parseInt(this.property.propertyId);
                const basketItemId = parseInt(this.property.basketItemId);
                const basketItem = this.basketItems.find(basketItem => basketItem.id === basketItemId);

                if (isDefined(basketItem))
                {
                    const properties = basketItem.variation.data.properties;
                    const property = properties.find(property => property.property.id === propertyId);

                    if (isDefined(property))
                    {
                        return property.property.selectionValues[this.property.value].name;
                    }
                }
            }
            // exclude properties of type 'none' (checkboxes)
            else if (isDefined(this.property.type) && this.property.type.length)
            {
                return this.property.value;
            }

            return null;
        },

        ...Vuex.mapState({
            basketItems: state => state.basket.items
        })
    }
});

