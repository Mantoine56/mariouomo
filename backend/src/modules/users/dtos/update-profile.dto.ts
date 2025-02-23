import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';

/**
 * DTO for updating a user profile
 * Extends CreateProfileDto but makes all fields optional
 */
export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
