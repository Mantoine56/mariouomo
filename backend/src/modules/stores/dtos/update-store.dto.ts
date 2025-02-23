import { PartialType } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';

/**
 * DTO for updating a store
 * Extends CreateStoreDto but makes all fields optional
 */
export class UpdateStoreDto extends PartialType(CreateStoreDto) {}
