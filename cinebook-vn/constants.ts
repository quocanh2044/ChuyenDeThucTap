import { Movie, ConcessionItem } from './types';

export const MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Dune: Hành Tinh Cát - Phần 2',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    duration: 166,
    rating: 8.9,
    poster: 'https://picsum.photos/seed/dune/300/450',
    backdrop: 'https://picsum.photos/seed/duneback/1200/600',
    description: 'Paul Atreides hợp nhất với Chani và người Fremen trong khi tìm cách trả thù những kẻ đã hủy hoại gia đình anh.',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    price: 90000
  },
  {
    id: '2',
    title: 'Kung Fu Panda 4',
    genre: ['Animation', 'Action', 'Comedy'],
    duration: 94,
    rating: 7.6,
    poster: 'https://picsum.photos/seed/panda/300/450',
    backdrop: 'https://picsum.photos/seed/pandaback/1200/600',
    description: 'Po phải tìm và huấn luyện một Chiến binh Rồng mới trong khi đối mặt với một phù thủy độc ác có kế hoạch triệu hồi lại tất cả những kẻ phản diện chính.',
    director: 'Mike Mitchell',
    cast: ['Jack Black', 'Awkwafina', 'Viola Davis'],
    price: 85000
  },
  {
    id: '3',
    title: 'Godzilla x Kong: Đế Chế Mới',
    genre: ['Action', 'Sci-Fi'],
    duration: 115,
    rating: 7.2,
    poster: 'https://picsum.photos/seed/gvk/300/450',
    backdrop: 'https://picsum.photos/seed/gvkback/1200/600',
    description: 'Hai người khổng lồ cổ đại Godzilla và Kong đụng độ trong một trận chiến hoành tráng khi con người khám phá nguồn gốc của chúng.',
    director: 'Adam Wingard',
    cast: ['Rebecca Hall', 'Brian Tyree Henry', 'Dan Stevens'],
    price: 95000
  },
  {
    id: '4',
    title: 'Exhuma: Quật Mộ Trùng Ma',
    genre: ['Horror', 'Mystery', 'Thriller'],
    duration: 134,
    rating: 8.1,
    poster: 'https://picsum.photos/seed/exhuma/300/450',
    backdrop: 'https://picsum.photos/seed/exhumaback/1200/600',
    description: 'Một gia đình giàu có ở Los Angeles trải qua một loạt các sự kiện siêu nhiên kỳ lạ, họ liên hệ với các pháp sư trẻ nổi tiếng để cứu đứa con mới sinh của mình.',
    director: 'Jang Jae-hyun',
    cast: ['Choi Min-sik', 'Kim Go-eun', 'Yoo Hae-jin'],
    price: 90000
  },
  {
    id: '5',
    title: 'Mai',
    genre: ['Romance', 'Drama'],
    duration: 131,
    rating: 7.8,
    poster: 'https://picsum.photos/seed/mai/300/450',
    backdrop: 'https://picsum.photos/seed/maiback/1200/600',
    description: 'Câu chuyện về cuộc đời đầy sóng gió của người phụ nữ tên Mai và mối tình chị em định mệnh.',
    director: 'Trấn Thành',
    cast: ['Phương Anh Đào', 'Tuấn Trần', 'Trấn Thành'],
    price: 80000
  }
];

export const COMING_SOON_MOVIES: Movie[] = [
  {
    id: 'cs1',
    title: 'Deadpool & Wolverine',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    duration: 120,
    rating: 0,
    poster: 'https://picsum.photos/seed/deadpool/300/450',
    backdrop: 'https://picsum.photos/seed/deadpoolback/1200/600',
    description: 'Wolverine đang hồi phục vết thương thì gặp gỡ Deadpool miệng mép. Cả hai cùng nhau hợp tác để đánh bại kẻ thù chung.',
    director: 'Shawn Levy',
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin'],
    price: 0,
    releaseDate: '26/07/2024'
  },
  {
    id: 'cs2',
    title: 'Despicable Me 4',
    genre: ['Animation', 'Comedy', 'Family'],
    duration: 95,
    rating: 0,
    poster: 'https://picsum.photos/seed/minions/300/450',
    backdrop: 'https://picsum.photos/seed/minionsback/1200/600',
    description: 'Gru, Lucy, Margo, Edith, và Agnes chào đón một thành viên mới trong gia đình, Gru Jr., người có ý định hành hạ cha mình.',
    director: 'Chris Renaud',
    cast: ['Steve Carell', 'Kristen Wiig', 'Will Ferrell'],
    price: 0,
    releaseDate: '05/07/2024'
  },
  {
    id: 'cs3',
    title: 'Joker: Folie à Deux',
    genre: ['Crime', 'Drama', 'Musical'],
    duration: 130,
    rating: 0,
    poster: 'https://picsum.photos/seed/joker/300/450',
    backdrop: 'https://picsum.photos/seed/jokerback/1200/600',
    description: 'Phần tiếp theo của Joker (2019), tiếp tục câu chuyện về Arthur Fleck và mối quan hệ điên loạn với Harley Quinn.',
    director: 'Todd Phillips',
    cast: ['Joaquin Phoenix', 'Lady Gaga', 'Zazie Beetz'],
    price: 0,
    releaseDate: '04/10/2024'
  },
  {
    id: 'cs4',
    title: 'Venom: The Last Dance',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    duration: 110,
    rating: 0,
    poster: 'https://picsum.photos/seed/venom/300/450',
    backdrop: 'https://picsum.photos/seed/venomback/1200/600',
    description: 'Eddie Brock và Venom tiếp tục cuộc hành trình đầy nguy hiểm khi bị truy đuổi bởi cả hai thế giới.',
    director: 'Kelly Marcel',
    cast: ['Tom Hardy', 'Juno Temple', 'Chiwetel Ejiofor'],
    price: 0,
    releaseDate: '25/10/2024'
  }
];

export const SHOWTIMES = ['10:00', '13:30', '16:45', '19:30', '22:15'];

export const CONCESSION_ITEMS: ConcessionItem[] = [
  {
    id: 'c1',
    name: 'iCombo 1 người',
    description: '1 Bắp lớn + 1 Nước ngọt cỡ vừa',
    price: 79000,
    image: 'https://img.freepik.com/premium-photo/popcorn-soda-cinema-background-generative-ai_561855-1555.jpg',
    type: 'combo'
  },
  {
    id: 'c2',
    name: 'iCombo 2 người',
    description: '1 Bắp cực lớn + 2 Nước ngọt cỡ lớn',
    price: 139000,
    image: 'https://img.freepik.com/premium-photo/bucket-popcorn-with-couple-cola-cups_434420-1365.jpg',
    type: 'combo'
  },
  {
    id: 'f1',
    name: 'Bắp Ngọt',
    description: 'Bắp rang bơ vị ngọt truyền thống (L)',
    price: 45000,
    image: 'https://img.freepik.com/free-photo/delicious-popcorn-studio_23-2150636608.jpg',
    type: 'food'
  },
  {
    id: 'f2',
    name: 'Bắp Phô Mai',
    description: 'Bắp rang lắc bột phô mai thơm lừng (L)',
    price: 55000,
    image: 'https://img.freepik.com/premium-photo/bowl-popcorn-with-cheese-powder_116547-507.jpg',
    type: 'food'
  },
  {
    id: 'd1',
    name: 'Coca Cola',
    description: 'Nước ngọt có gas (Ly lớn)',
    price: 35000,
    image: 'https://img.freepik.com/free-photo/fresh-cola-drink-glass_144627-16201.jpg',
    type: 'drink'
  },
  {
    id: 'd2',
    name: 'Dasani Water',
    description: 'Nước suối tinh khiết',
    price: 25000,
    image: 'https://img.freepik.com/free-vector/realistic-water-bottle_1284-11059.jpg',
    type: 'drink'
  }
];