import { PartialType } from '@nestjs/swagger';
import { CreateDiscountDto } from './create-discount.dto';

/**
 * DTO for updating an existing discount
 * Extends CreateDiscountDto but makes all fields optional
 */
export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {}
