import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const imageUrlsTransformer = {
  to: (value: string[] | null): string | null => (value?.length ? JSON.stringify(value) : null),
  from: (value: string | null): string[] | null => {
    if (!value) {
      return null;
    }

    try {
      const parsedValue = JSON.parse(value);
      return Array.isArray(parsedValue)
        ? parsedValue.filter((imageUrl): imageUrl is string => typeof imageUrl === 'string')
        : null;
    } catch {
      return null;
    }
  },
};

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, transformer: { to: Number, from: Number } })
  price: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: true,
    transformer: { to: Number, from: (value: string | null) => (value === null ? null : Number(value)) },
  })
  discountPrice: number | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({
    type: 'text',
    nullable: true,
    transformer: imageUrlsTransformer,
  })
  imageUrls: string[] | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 80, nullable: true })
  sku: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string | null;

  @Column({ type: 'int', nullable: true })
  persons: number | null;

  @Column({ type: 'int', nullable: true })
  pieces: number | null;

  @Column({ type: 'int', nullable: true })
  lowStockThreshold: number | null;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
