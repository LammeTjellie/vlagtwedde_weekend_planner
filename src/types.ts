export type Category = 'bezienswaardigheid' | 'attractie' | 'activiteit' | 'idee';

export interface Activity {
  id: string;
  title: string;
  description: string;
  url?: string;
  distance: number;
  category: Category;
  image?: string;
}
